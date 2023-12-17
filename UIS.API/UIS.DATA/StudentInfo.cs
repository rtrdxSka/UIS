using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UIS.DATA
{
    public class StudentInfo
    {
        public int Id { get; set; }
        public string Username { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public ICollection<DiscordData> DiscordData { get; set; } = null!;
    }
}
