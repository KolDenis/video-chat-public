using back_end.Attributes;
using back_end.Models;
using back_end.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace back_end.Controllers
{
    public class RoomsController : Controller
    {
        private readonly RoomsService roomsService;

        public RoomsController(RoomsService rs)
        {
            roomsService = rs;
        }

        [JWTMiddleware]
        [HttpPost]
        public async Task<IActionResult> Token()
        {
            string userId = (string)HttpContext.Items["userID"];

            string roomId = roomsService.isUserInAnyRoom(userId);
            if (roomId == null)
                return Unauthorized("User is not registered in room");

            try
            {
                var token = CreateLiveKitJWT(roomId, userId);
                return Json(new { token });
            }catch (Exception ex) {
                return BadRequest(new { errorMessage = ex.Message});
            }
        }

        string CreateLiveKitJWT(string roomId, string participantId)
        {
            JwtHeader headers = new(new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GlobalVars.LIVEKIT_API_SECRET)), "HS256"));

            var videoGrants = new Dictionary<string, object>()
            {
                { "room", roomId },
                { "roomJoin", true }
            };

            JwtPayload payload = new()
            {
                { "exp", new DateTimeOffset(DateTime.UtcNow.AddHours(6)).ToUnixTimeSeconds() },
                { "iss", GlobalVars.LIVEKIT_API_KEY },
                { "nbf", 0 },
                { "sub", participantId},
                { "room", roomId },
                { "video", videoGrants }
            };
            JwtSecurityToken token = new(headers, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost]
        public async Task<IActionResult> Webhook()
        {
            return Ok();
        }

        [JWTMiddleware]
        [HttpGet]
        public IActionResult CheckMeetByID(string meetID)
        {
            return Json(new { isAlive = roomsService.isRoom(meetID) });
        }

        [JWTMiddleware]
        [HttpPost]
        public IActionResult createRoom(string meetID) 
        {
            string roomID = roomsService.CreateRoom(meetID);
            
            return Json(new { roomID });
        } 
    }
}
