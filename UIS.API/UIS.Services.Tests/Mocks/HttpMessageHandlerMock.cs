namespace UIS.Services.Tests.Mocks;

internal class HttpMessageHandlerMock : HttpMessageHandler
{
    private readonly HttpResponseMessage _httpResponseMessageMock;

    public HttpMessageHandlerMock(HttpResponseMessage httpResponseMessageMock)
    {
        _httpResponseMessageMock = httpResponseMessageMock;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        return Task.FromResult(_httpResponseMessageMock);
    }
}