using RichardSzalay.MockHttp;
using System.Net;
using System.Net.Http;
using FakeItEasy;
using UIS.DAL.Constants;
using UIS.DAL.DTO;
using UIS.DATA;
using UIS.Services.Auth;
using Xunit;

public class AuthServiceTests
{
    private readonly AuthService _authService;
    private readonly IStudentsRepository _mockStudentsRepository;
    private readonly MockHttpMessageHandler _mockHttp;
    private readonly HttpClient _httpClient;

    public AuthServiceTests()
    {
        _mockStudentsRepository = A.Fake<IStudentsRepository>();
        _mockHttp = new MockHttpMessageHandler();
        var httpClient = _mockHttp.ToHttpClient();
        _httpClient = _mockHttp.ToHttpClient();

        _authService = new AuthService(_mockStudentsRepository);
    }

    [Fact]
    public async Task GetTokenAsync_WithValidCode_ReturnsExpectedResponse()
    {
        // Arrange
        var code = "valid_code";
        var mockHttpClient = _mockHttp.ToHttpClient(); // Create the mock HttpClient
        _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.TokenUrl)
            .Respond("application/json", "{\"access_token\": \"token123\", ...}"); // Mock response

        // Act
        var result = await _authService.GetTokenAsync(mockHttpClient, code);

        // Assert
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
       
    }

    [Fact]
    public async Task GetUserInfoAsync_WithValidToken_ReturnsExpectedResponse()
    {
        // Arrange
        var mockToken = new MoodleTokenDTO { AccessToken = "test_access_token" };
        var mockHttpClient = _mockHttp.ToHttpClient(); // Create the mock HttpClient
        _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.UserInfoUrl)
            .WithFormData(new[] { new KeyValuePair<string, string>("access_token", mockToken.AccessToken) })
            .Respond("application/json", "{\"id\": \"123\", ...}"); // Mock response

        // Act
        var result = await _authService.GetUserInfoAsync(mockHttpClient, mockToken);

        // Assert
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
       
    }

    public class AddStudentToDbTests : AuthServiceTests
    {
        [Fact]
        public async Task AddStudentToDb_WithValidStudentInfo_AddsStudent()
        {
            // Arrange
            var studentInfo = new StudentInfo { /* Initialize properties */ };

            // Act
            await _authService.AddStudentToDb(studentInfo);

            // Assert
            A.CallTo(() => _mockStudentsRepository.AddAsync(studentInfo)).MustHaveHappenedOnceExactly();
            A.CallTo(() => _mockStudentsRepository.SaveChangesAsync()).MustHaveHappenedOnceExactly();
        }

        [Fact]
        public async Task AddStudentToDb_WithNullStudentInfo_ThrowsArgumentNullException()
        {
            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentNullException>(() => _authService.AddStudentToDb(null));
            Assert.Equal("studentInfo", exception.ParamName); // Optionally verify the parameter name
        }
    }
    
    public class GetTokenAsyncTests : AuthServiceTests
    {
        [Fact]
        public async Task GetTokenAsync_WithValidCode_ReturnsToken()
        {
            // Arrange
            _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.TokenUrl)
                .Respond("application/json", "{\"access_token\": \"token123\", \"expires_in\": 3600}");

            // Act
            var response = await _authService.GetTokenAsync(_httpClient, "valid_code");

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("token123", content);
        }

        [Fact]
        public async Task GetTokenAsync_WithInvalidCode_ReturnsBadRequest()
        {
            // Arrange
            _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.TokenUrl)
                .Respond(HttpStatusCode.BadRequest);

            // Act
            var response = await _authService.GetTokenAsync(_httpClient, "invalid_code");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
    public class GetUserInfoAsyncTests : AuthServiceTests
    {
        [Fact]
        public async Task GetUserInfoAsync_WithValidToken_ReturnsUserInfo()
        {
            // Arrange
            var token = new MoodleTokenDTO { AccessToken = "valid_token" };
            _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.UserInfoUrl)
                .WithFormData(new[] { new KeyValuePair<string, string>("access_token", token.AccessToken) })
                .Respond("application/json", "{\"id\": \"123\"}");

            // Act
            var response = await _authService.GetUserInfoAsync(_httpClient, token);

            // Assert
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("\"id\": \"123\"", content);
        }

        [Fact]
        public async Task GetUserInfoAsync_WithInvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var token = new MoodleTokenDTO { AccessToken = "invalid_token" };
            _mockHttp.When(HttpMethod.Post, MoodleAuthConstants.UserInfoUrl)
                .WithFormData(new[] { new KeyValuePair<string, string>("access_token", token.AccessToken) })
                .Respond(HttpStatusCode.BadRequest);

            // Act
            var response = await _authService.GetUserInfoAsync(_httpClient, token);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }


}

