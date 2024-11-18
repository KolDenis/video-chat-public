using back_end.Attributes;
using back_end.Controllers;
using back_end.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace back
{
    public class SignalHub : Hub
    {
        private readonly RoomsService roomsService;
        private readonly UsersService usersService;
        public SignalHub(UsersService us, RoomsService rs)
        {
            usersService = us;
            roomsService = rs;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            if (httpContext == null)
            {
                await Clients.Caller.SendAsync("ServerMessage", "No HTTP Context");
                Context.Abort();
                return;
            }

            var token = httpContext.Request.Cookies["jwt"];
            if (string.IsNullOrEmpty(token))
            {
                await Clients.Caller.SendAsync("ServerMessage", "JWT token is undefined");
                Context.Abort();
                return;
            }

            string userId;
            if (!JWTMiddleware.IsValidToken(token, out userId))
            {
                await Clients.Caller.SendAsync("ServerMessage", "Invalid token");
                Context.Abort();
                return;
            }

            string roomId = httpContext.Request.Query["roomId"];

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("ServerMessage", "User is undefined");
                Context.Abort();
                return;
            }
            if (string.IsNullOrEmpty(roomId))
            {
                await Clients.Caller.SendAsync("ServerMessage", "Room is undefined");
                Context.Abort();
                return;
            }
            if (!roomsService.isRoom(roomId))
            {
                await Clients.Caller.SendAsync("ServerMessage", "Room is undefined");
                Context.Abort();
                return;
            }   

            Context.Items.Add("user", usersService.GetUserById(userId));
            Context.Items.Add("roomId", roomId);

            roomsService.AddUser(roomId, usersService.GetUserById(userId).id, Context.ConnectionId);

            SendUsersList(roomId, userId);
            SendNewUser(roomId, userId);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            User user = (User)Context.Items["user"];
            string roomId = (string)Context.Items["roomId"];
            if(user is not null && roomId is not null )
            {
                roomsService.RemoveUser(roomId, user.id);
                if(roomsService.GetUsersOfRoom(roomId).Count == 0)
                {
                    roomsService.RemoveRoom(roomId);
                }
                else
                {
                    SendRemoveUser(roomId, user.id);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        private void SendUsersList(string roomId, string userId)
        {
            List<string> userIds = roomsService.GetUsersOfRoom(roomId).Keys.ToList();

            List<object> usersToSend = new List<object>();

            foreach (string item in userIds)
            {
                if (item == userId) continue;

                usersToSend.Add(new { id = item, name = usersService.GetUserById(item).name });
            }

            Dictionary<string, string> users = roomsService.GetUsersOfRoom(roomId);
            Clients.Client(users[userId]).SendAsync("Users", usersToSend);
        }

        private void SendNewUser(string roomId, string userId)
        {
            SendDataToRoom(roomId, "NewUser", new {id = userId, name = usersService.GetUserById(userId).name }, userId);
        }
        
        private void SendRemoveUser(string roomId, string userId)
        {
            SendDataToRoom(roomId, "RemoveUser", userId);
        }

        public async Task SendMessage(string message)
        {
            User user = (User)Context.Items["user"];
            string roomId = (string)Context.Items["roomId"];

            var data = new
            {
                sender = user.name,
                text = message
            };

            SendDataToRoom(roomId, "Message", data);
        }

        private void SendDataToRoom(string roomId, string eventName, object data, string exceptUser = "")
        {
            Dictionary<string, string> users = roomsService.GetUsersOfRoom(roomId);
            foreach (var userId in users.Keys)
            {
                if (userId == exceptUser) continue;

                Clients.Client(users[userId]).SendAsync(eventName, data);
            }
        }
    }
}
