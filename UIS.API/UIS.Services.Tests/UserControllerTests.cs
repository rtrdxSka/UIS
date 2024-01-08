using System.Net;
using System.Net.Http;
using System.Text;
using FakeItEasy;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using RichardSzalay.MockHttp;
using UIS.API.Controllers;
using UIS.DAL.DTO;
using UIS.Services.Auth;
using Xunit;

namespace UnitTests
{
    public class UserControllerTests
    {
        private readonly UserController _controller;
        private readonly MockHttpMessageHandler _mockHttp;

        public UserControllerTests()
        {
            _mockHttp = new MockHttpMessageHandler();
            var httpClient = _mockHttp.ToHttpClient();
            var studentsRepository = A.Fake<IStudentsRepository>();
            var authService = new AuthService(studentsRepository); // Assuming AuthService takes HttpClient in constructor
            _controller = new UserController(authService);
        }

        private void SetupMockResponse(string requestUri, HttpStatusCode statusCode, string responseBody)
        {
            _mockHttp.When(requestUri)
                .Respond(statusCode, _ => new StringContent(responseBody, Encoding.UTF8, "application/json"));
        }

        

        [Fact]
        public async Task HandleMoodleAuthCallbackAsync_TokenRetrievalFailure_ReturnsBadRequest()
        {
            // Arrange
            SetupMockResponse("http://example.com/token", HttpStatusCode.BadRequest, "");

            // Act
            var result = await _controller.HandleMoodleAuthCallbackAsync("code", "discord_id", "guild_id");

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task HandleMoodleAuthCallbackAsync_UserInfoRetrievalFailure_ReturnsBadRequest()
        {
            // Arrange
            SetupMockResponse("http://example.com/token", HttpStatusCode.OK, "{\"accessToken\":\"mock_token\"}");
            SetupMockResponse("http://example.com/userinfo", HttpStatusCode.BadRequest, "");

            // Act
            var result = await _controller.HandleMoodleAuthCallbackAsync("code", "discord_id", "guild_id");

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task HandleMoodleAuthCallbackAsync_DeserializationFailure_ReturnsBadRequest()
        {
            // Arrange
            SetupMockResponse("http://example.com/token", HttpStatusCode.OK, "Invalid JSON");

            // Act
            var result = await _controller.HandleMoodleAuthCallbackAsync("code", "discord_id", "guild_id");

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task HandleMoodleAuthCallbackAsync_NullUserInfo_ReturnsBadRequest()
        {
            // Arrange
            SetupMockResponse("http://example.com/token", HttpStatusCode.OK, "{\"accessToken\":\"mock_token\"}");
            SetupMockResponse("http://example.com/userinfo", HttpStatusCode.OK, "null");

            // Act
            var result = await _controller.HandleMoodleAuthCallbackAsync("code", "discord_id", "guild_id");

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        [Fact]
        public async Task HandleMoodleAuthCallbackAsync_HttpClientException_HandledGracefully()
        {
            // Arrange
            _mockHttp.When("http://example.com/token").Throw(new HttpRequestException());

            // Act
            var result = await _controller.HandleMoodleAuthCallbackAsync("code", "discord_id", "guild_id");

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }
    }
}
