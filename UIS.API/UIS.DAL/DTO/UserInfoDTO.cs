using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MoodleIntegration.Shared.DTO
{
    public class UserInfoDTO
    {
        // Moodle ?
        // string for auth
        public string id { get; set; }
        public string idnumber { get; set; }
        public string auth { get; set; }
        public string username { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public string email { get; set; }
        public string lang { get; set; }
        public string country { get; set; }
        public string phone1 { get; set; }
        public string address { get; set; }
        public string description { get; set; }
    }
}
