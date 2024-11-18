using back_end.Attributes;
using back_end.Services;
using IdentityModel;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Numerics;
using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;
using static System.Formats.Asn1.AsnWriter;

namespace back_end.Controllers
{
    public class OAuthController : Controller
    {
        private readonly UsersService myDataService;

        private CookieOptions cookieOptions;
        
        public OAuthController(UsersService my)
        {
            myDataService = my;
            cookieOptions = new CookieOptions() {
                Expires = DateTime.UtcNow.AddHours(24),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax
            };
        }

        [HttpGet]
        public IActionResult GetUrl()
        {
            try
            {
                var scopes = new[] { "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email" };
                string scope = string.Join(" ", scopes);

                string redirectUrl = $"http://localhost:3000/code";
                string verCode = Guid.NewGuid().ToString();
                string code = ComputeHash(verCode);

                HttpContext.Session.SetString("codeVerifier", verCode);

                string url = GoogleAuth.GenerateOAuthReqUrl(scope, redirectUrl, code);
                return Json(new { url });
            }
            catch (Exception ex)
            {
                return Json(new { success = "false", error = "true", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Code(string code)
        {
            string redirectUrl = "http://localhost:3000/code";
            string verCode = HttpContext.Session.GetString("codeVerifier");
            TokenResult resToken = await GoogleAuth.ExchangeCodeToToken(code, verCode, redirectUrl);
            if (resToken == null)
                return BadRequest("Token is invalid");

            UserInfo res = await GoogleAuth.GetUserInfo(resToken.access_token);
            if (res == null)
                return BadRequest("Token is invalid");

            User targetUser = myDataService.GetUserById(res.Id);

            if (targetUser == null)
                myDataService.AddUser(new User() { id = res.Id, name = res.Name, email = res.Email , typeOfAuth = "GoogleAuth" });

            string jwt = createJWTToken(res.Id);
            HttpContext.Response.Cookies.Append("jwt", jwt, cookieOptions);

            User user = myDataService.GetUserById(res.Id);
            return Json(new { authed = true, user });
        }

        string createJWTToken(string userId)
        {
            JwtHeader headers = new(new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GlobalVars.LIVEKIT_API_SECRET)), SecurityAlgorithms.HmacSha256));

            JwtPayload payload = new()
            {
                { "exp", new DateTimeOffset(DateTime.UtcNow.AddHours(24)).ToUnixTimeSeconds() },
                { "iss", GlobalVars.LIVEKIT_API_KEY },
                { "sub", userId}
            };
            JwtSecurityToken token = new(headers, payload);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [JWTMiddleware]
        [HttpGet]
        public IActionResult isAuthed()
        {
            string userID = (string)HttpContext.Items["userID"];
            User user = myDataService.GetUserById(userID);

            return Json(new { authed = true, user });
        }

        [JWTMiddleware]
        [HttpGet]
        public IActionResult getUserCredentialsByID()
        {
            string userID = (string)HttpContext.Items["userID"];
            
            if (String.IsNullOrEmpty(userID)) return BadRequest("UserID is undefined");

            User targetUser = myDataService.GetUserById(userID);
            
            if (targetUser == null) return BadRequest("User is undefined");

            return Json(new { user = targetUser });
        }

        [JWTMiddleware]
        [HttpPost]
        public IActionResult changeUserCredentialsByID(string newName, string newEmail, string newPassword)
        {
            string userID = (string)HttpContext.Items["userID"];

            User user = myDataService.GetUserById(userID);
            if(user == null) return BadRequest("User is undefined");

            bool nameChanged = newName != user.name;
            bool emailChanged = newEmail != user.email;
            bool passwordChanged = newPassword != user.password;
            
            bool isSuccess = false;

            if (emailChanged)
            {
                var users = myDataService.GetUserByEmail(newEmail);
                if (users == null)
                {
                    user.name = newName;
                    user.email = newEmail;
                    user.password = ComputeHash(newPassword);

                    myDataService.UpdateUser(userID, user);

                    isSuccess = true;
                }
                else
                {
                    return BadRequest("Email is busy");
                }

                return Json(new { success = isSuccess });
            }

            if (nameChanged)
            {
                user.name = newName;

            }
            if (passwordChanged)
            {
                user.password = ComputeHash(newPassword);
            }
            
            myDataService.UpdateUser(userID, user);

            isSuccess = true;

            return Json(new { success = isSuccess });
        }

        public static string ComputeHash(string codeVerifier)
        {
            using var sha256 = SHA256.Create();
            var challengeBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(codeVerifier));
            var codeChallenge = Base64Url.Encode(challengeBytes);
            return codeChallenge;
        }

        [HttpPost]
        public IActionResult loginByCredentials(string email, string password)
        {
            if(string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return BadRequest("Wrong data");
            }

            User user = myDataService.TryLogin(email, ComputeHash(password));

            if(user == null)
            {
                return Json(new { authed = false});
            }

            string jwt = createJWTToken(user.id);
            HttpContext.Response.Cookies.Append("jwt", jwt, cookieOptions);

            return Json(new { authed = true, user });
        }

        string createUniqueId()
        {
            Random random = new Random();
            string id = "";
            byte[] buffer = new byte[16];
            while (true) {
                random.NextBytes(buffer);

                BigInteger bigInt = new BigInteger(buffer);
                if (bigInt < 0)
                    bigInt = -bigInt;

                id = bigInt.ToString();
                User user = myDataService.GetUserById(id);
                if(user == null)
                {
                    break;
                }
            }

            return id;
        }

        [HttpPost]
        public IActionResult registerByCredentials(string name, string email, string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                return BadRequest("Wrong data");
            }

            if(myDataService.GetUserByEmail(email) != null)
            {
                return Json(new {registered = false, message = "Користувач з такою поштою вже існує"});
            }

            User user = new User() { id = createUniqueId(), name = name, email = email, password = ComputeHash(password), typeOfAuth = "Password" };
            myDataService.AddUser(user);

            string jwt = createJWTToken(user.id);
            HttpContext.Response.Cookies.Append("jwt", jwt, cookieOptions);

            return Json(new { registered = true, user });
        }
    }
}
