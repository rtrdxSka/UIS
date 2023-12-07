using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UIS.DATA
{
    public class DiscordData
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string DiscordId { get; set; } = null!;
        public string GuildId { get; set; } = null!;
        public StudentInfo StudentInfo { get; set; } = null!;
    }
}
