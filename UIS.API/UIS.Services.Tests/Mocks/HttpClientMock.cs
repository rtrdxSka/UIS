namespace UIS.Services.Tests.Mocks;

internal class HttpClientMock : HttpClient
{
    public HttpClientMock(HttpResponseMessage resultMock) : base(new HttpMessageHandlerMock(resultMock))
    { }
}