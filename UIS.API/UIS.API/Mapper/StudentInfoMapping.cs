using AutoMapper;

using UIS.DAL.DTO;
using UIS.DATA;

namespace UIS.API.Mapper
{
    public class StudentInfoMapping : Profile
    {
        public StudentInfoMapping()
        {
            CreateMap<StudentInfoDTO, StudentInfo>();
        }
    }
}
