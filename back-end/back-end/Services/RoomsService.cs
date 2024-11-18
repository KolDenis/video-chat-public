using System.Linq;
using System.Net.WebSockets;

namespace back_end.Services
{
    public class Room
    {
        string id;
        Dictionary<string, string> users;

        public Room(string id)
        {
            this.id = id;
            users = new Dictionary<string, string>();
        }

        public string GetId() {
            return id;
        }

        public Dictionary<string, string> GetUsers()
        {
            return users;
        }

        public void AddUser(string id, string connectionId)
        {
            users.Add(id, connectionId);
        }

        public void RemoveUser(string userId)
        {
            users.Remove(userId);
        }
    }
    public class RoomsService
    {
        private Dictionary<string, Room> rooms;
        Random random = new Random();

        public RoomsService()
        {
            rooms = new Dictionary<string, Room>();
            rooms.Add("123", new Room("123"));
        }

        public string CreateRoom()
        {
            while(true)
            {
                string newId = random.Next(0, 100000000).ToString("D8");

                string result = CreateRoom(newId);
                if(result is not null)
                {
                    return result;
                }
            }
        }

        public string CreateRoom(string id)
        {
            HashSet<string> idSet = new HashSet<string>(rooms.Keys);

            if (!idSet.Contains(id))
            {
                rooms.Add(id, new Room(id));
                return id;
            }

            return null;
        }

        public void RemoveRoom(string id)
        {
            rooms.Remove(id);
        }

        public bool isRoom(string id)
        {
            return rooms.ContainsKey(id);
        }

        public void AddUser(string roomId, string userId, string connectionId)
        {
            rooms[roomId].AddUser(userId, connectionId);
        }

        public Dictionary<string, string> GetUsersOfRoom(string roomId)
        {
            return rooms[roomId].GetUsers();
        }

        public bool isUserInRoom(string roomId, string userId)
        {
            if (!isRoom(roomId))
                return false;

            if (!rooms[roomId].GetUsers().ContainsKey(userId))
                return false;
             
            return true;
        }

        public string isUserInAnyRoom(string userId)
        {
            foreach (Room room in rooms.Values)
            {
                if (room.GetUsers().Keys.Contains(userId))
                    return room.GetId();
            }
            return null;
        }

        public void RemoveUser(string roomId, string userId)
        {
            rooms[roomId].RemoveUser(userId);
        }
    }
}
