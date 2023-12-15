using System.Net;
using FakeItEasy;
using UIS.Services.Auth;

namespace UIS.SERVICES.TESTS;

public class UnitTest1
{
    [Fact]
    public async Task GetTokenAsync_ReturnsHttpResponseMessage()
    {
        // Arrange
        var fakeHandler = A.Fake<FakeHttpMessageHandler>(options => options.CallsBaseMethods());
        A.CallTo(() => fakeHandler.Send(A<HttpRequestMessage>._, A<CancellationToken>._))
            .Returns(new HttpResponseMessage(HttpStatusCode.OK));

        var httpClient = new HttpClient(fakeHandler);
        var authService = new AuthService(httpClient);
        var code = "some_code";

        // Act
        var actualResponse = await authService.GetTokenAsync(httpClient, code);

        // Assert
        Assert.Equal(HttpStatusCode.OK, actualResponse.StatusCode);
    }

}