using Newtonsoft.Json;

namespace back_end.Services
{
    public class UsersService
    {
        private List<User> userList;
        private readonly string filePath = "Users.json";

        public UsersService()
        {
            LoadData();
        }

        public List<User> GetUserList()
        {
            return userList;
        }

        public User GetUserById(string userId)
        {
            return userList.Find(u => u.id == userId);
        }

        public User GetUserByEmail(string userEmail)
        {
            return userList.Find(u => u.email == userEmail);
        }

        public void AddUser(User newUser)
        {
            userList.Add(newUser);
            SaveData();
        }

        public void UpdateUser(string userId, User updatedUser)
        {
            var existingUser = userList.Find(u => u.id == userId);
            if (existingUser != null)
            {
                existingUser.name = updatedUser.name;
                existingUser.email = updatedUser.email;
                existingUser.password = updatedUser.password;

                SaveData();
            }
        }

        public User TryLogin(string email, string password)
        {
            User user = GetUserByEmail(email);
            if(user == null)
            {
                return null;
            }
            return user.password == password ? user : null;
        }

        private void LoadData()
        {
            if (File.Exists(filePath))
            {
                string json = File.ReadAllText(filePath);
                userList = JsonConvert.DeserializeObject<List<User>>(json);
            }
            else
            {
                userList = new List<User>();
            }
        }

        private void SaveData()
        {
            string json = JsonConvert.SerializeObject(userList, Formatting.Indented);
            File.WriteAllText(filePath, json);
        }

        ~UsersService()
        {
            SaveData();
        }
    }

    public class User
    {
        public string id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string typeOfAuth { get; set; }
    }
}
