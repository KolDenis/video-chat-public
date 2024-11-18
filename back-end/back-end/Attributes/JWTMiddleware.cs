using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace back_end.Attributes
{
    public class JWTMiddleware : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var httpContext = context.HttpContext;

            if (httpContext == null)
            {
                context.Result = new BadRequestObjectResult("Http context is undefined");
                return;
            }

            var token = httpContext.Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(token))
            {
                context.Result = new UnauthorizedObjectResult("JWT token is undefined");
                return;
            }

            string userID;

            if (!IsValidToken(token, out userID))
            {
                context.Result = new UnauthorizedObjectResult("Invalid token");
                return;
            }

            httpContext.Items["userID"] = userID;
        }

        static public bool IsValidToken(string token, out string userID)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GlobalVars.LIVEKIT_API_SECRET)),
                ValidateIssuer = true,
                ValidateAudience = false,
                ValidIssuer = GlobalVars.LIVEKIT_API_KEY,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null)
                {
                    userID = userIdClaim.Value;
                    return true;
                }
            }
            catch (Exception ex)
            {
                userID = "";
                return false;
            }

            userID = "";
            return false;
        }
    }
}
