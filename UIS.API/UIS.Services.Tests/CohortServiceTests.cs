using System.Text;
using AutoMapper;
using FakeItEasy;
using Microsoft.AspNetCore.Http;
using RichardSzalay.MockHttp;
using UIS.Services.Cohort;

public class CohortServiceTests
{
    private readonly CohortService _cohortService;
    private readonly IStudentsRepository _mockStudentsRepository;
    private readonly IMapper _mockMapper;
    private readonly MockHttpMessageHandler _mockHttp;
    private readonly HttpClient _httpClient;

    public CohortServiceTests()
    {
        _mockStudentsRepository = A.Fake<IStudentsRepository>();
        _mockMapper = A.Fake<IMapper>();
        _mockHttp = new MockHttpMessageHandler();
        _httpClient = _mockHttp.ToHttpClient();
        _cohortService = new CohortService(_mockStudentsRepository, _mockMapper);
    }
    
    private IFormFile CreateFakeFormFile(string content, string contentType, string fileName)
    {
        // Create a MemoryStream over the content you want to have in the file
        var bytes = Encoding.UTF8.GetBytes(content);
        var stream = new MemoryStream(bytes);

        // Create a fake IFormFile using FakeItEasy
        var fakeFile = A.Fake<IFormFile>();
        A.CallTo(() => fakeFile.FileName).Returns(fileName);
        A.CallTo(() => fakeFile.ContentType).Returns(contentType);
        A.CallTo(() => fakeFile.OpenReadStream()).Returns(stream);
        A.CallTo(() => fakeFile.Length).Returns(stream.Length);

        return fakeFile; // Return the fake IFormFile object
    }
    
    public class GetMoodleCohortsAsyncTests : CohortServiceTests
    {
        [Fact]
        public async Task GetMoodleCohortsAsync_ValidJwt_ReturnsCohortsList()
        {
            // Arrange
            // Mock the HttpClient to return expected responses for the Moodle API calls

            // Act
            var result = await _cohortService.GetMoodleCohortsAsync(_httpClient, "valid-jwt");

            // Assert
            Assert.NotNull(result);
            // More assertions to check the actual data
        }

        // More tests to cover edge cases and exceptional scenarios
    }



}