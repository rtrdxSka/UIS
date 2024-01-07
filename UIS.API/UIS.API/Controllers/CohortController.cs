using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UIS.DAL.DTO;
using UIS.Services.Cohort;

namespace UIS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CohortController : ControllerBase
    {
        private readonly ICohortService _cohortService;

        public CohortController(ICohortService cohortService)
        {
            _cohortService = cohortService;
        }

        [HttpPost("SyncCohorts")]
        public async Task<ActionResult<List<CohortUpdateDataDTO>>> SyncCohortsAsync([FromForm] IFormFile csvFile)
        {
            // Refactor

            if (csvFile == null || csvFile.Length == 0)
            {
                return BadRequest("File not provided");
            }

            using (var client = new HttpClient())
            {
                var cohortsUpdateData = await _cohortService.ExtractMoodleSyncDataAsync(client, "9d21c61ac5ffa93a2dc9a3e6102fc67a", csvFile);

                return Ok(cohortsUpdateData);
            }
        }

        [HttpPost("RemoveStudentsFromCohort")]
        public async Task<ActionResult> DeleteStudentsFromCohortAsync([FromBody] MoodleUpdateCohortsDTO updateData)
        {
            using (var client = new HttpClient())
            {
                if(updateData.data != null)
                {
                    await _cohortService.DeleteStudentsFromMoodleCohortAsync(client, "9d21c61ac5ffa93a2dc9a3e6102fc67a", updateData.data, updateData.cohortId);

                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
        }

        [HttpPost("AddStudentsToCohort")]
        public async Task<ActionResult> AddStudentsToCohortAsync([FromBody] MoodleUpdateCohortsDTO updateData)
        {
            using (var client = new HttpClient())
            {
                if (updateData.data != null)
                {
                    // Creates user account if it does not find a moodle user with the provided username

                    await _cohortService.AddStudentToMoodleCohortAsync(client, "9d21c61ac5ffa93a2dc9a3e6102fc67a", updateData.data, updateData.cohortId);

                    await _cohortService.SaveStudentsInfoAsync(updateData.data);

                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
        }
    }
}
