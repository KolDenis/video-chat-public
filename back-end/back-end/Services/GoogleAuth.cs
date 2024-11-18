using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Security.Policy;
using static System.Formats.Asn1.AsnWriter;

namespace back_end.Services
{
    public static class GoogleAuth
    {
        const string ClientID = "";
        const string ClientSecret = "";

        public static string GenerateOAuthReqUrl(string scope, string redirectUrl, string code)
        {
            string OAuthServerEndPoint = "https://accounts.google.com/o/oauth2/v2/auth";

            var queryParams = new Dictionary<string, string>()
            {
                { "client_id", ClientID},
                { "redirect_uri", redirectUrl},
                { "response_type", "code"},
                { "scope", scope},
                { "code_challenge", code},
                { "code_challenge_method", "S256"},
            };

            var url = QueryHelpers.AddQueryString(OAuthServerEndPoint, queryParams);
            return url;
        }

        public static async Task<TokenResult> ExchangeCodeToToken(string code, string codeVerifier, string redirectUrl)
        {
            string OAuthServerEndPoint = "https://oauth2.googleapis.com/token";

            var queryParams = new Dictionary<string, string>()
            {
                { "client_id", ClientID},
                { "client_secret", ClientSecret},
                { "code", code},
                { "code_verifier", codeVerifier},
                { "grant_type", "authorization_code"},
                { "redirect_uri", redirectUrl},
                { "access_type", "offline"},
            };

            using (HttpClient client = new HttpClient())
            {
                // Преобразуйте данные в формат, пригодный для отправки
                HttpContent content = new FormUrlEncodedContent(queryParams);

                // Отправьте POST-запрос и получите ответ
                HttpResponseMessage response = await client.PostAsync(OAuthServerEndPoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseContent);
                var headers = response.Headers;
                Console.WriteLine("Response Headers: " + headers);

                // Обработайте ответ
                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<TokenResult>(responseBody);
                }
                else
                {
                    Console.WriteLine("Ошибка при обмене токена");
                    Console.WriteLine("Ошибка: " + response.StatusCode);
                    Console.WriteLine();
                    return null;
                }
            }
        }

        public static async Task<TokenResult> RefreshToken(string refreshToken)
        {
            string OAuthServerEndPoint = "https://oauth2.googleapis.com/token";

            var refreshParams = new Dictionary<string, string>
            {
                { "client_id", ClientID },
                { "client_secret", ClientSecret },
                { "grant_type", "refresh_token" },
                { "refresh_token", refreshToken }
            };

            using (HttpClient client = new HttpClient())
            {
                // Преобразуйте данные в формат, пригодный для отправки
                HttpContent content = new FormUrlEncodedContent(refreshParams);

                // Отправьте POST-запрос и получите ответ
                HttpResponseMessage response = await client.PostAsync(OAuthServerEndPoint, content);

                // Обработайте ответ
                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<TokenResult>(responseBody);
                }
                else
                {
                    Console.WriteLine("Ошибка при получении токена");
                    Console.WriteLine("Ошибка: " + response.StatusCode);
                    Console.WriteLine();
                    return null;
                }
            }
        }

        public static async Task<UserInfo> GetUserInfo(string accessToken)
        {
            string url = "https://www.googleapis.com/oauth2/v1/userinfo";
            using (HttpClient client = new HttpClient())
            {
                // Установите заголовок Authorization с использованием access токена
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                // Отправьте GET-запрос к эндпоинту userinfo
                HttpResponseMessage response = await client.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    return JsonConvert.DeserializeObject<UserInfo>(responseBody);
                }
                else
                {
                    Console.WriteLine("Ошибка при получении токена");
                    Console.WriteLine("Ошибка: " + response.StatusCode);
                    Console.WriteLine();
                    return null;
                }
            }
        }
    }

    public class UserInfo
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("picture")]
        public string PictureURL { get; set; }
    }

    public class TokenResult
    {
        [JsonProperty("access_token")]
        public string access_token { get; set; }

        [JsonProperty("expires_in")]
        public string expires_in { get; set; }

        [JsonProperty("scope")]
        public string scope { get; set; }

        [JsonProperty("token_type")]
        public string token_type { get; set; }

        [JsonProperty("refresh_token")]
        public string refresh_token { get; set; }
    }
}
