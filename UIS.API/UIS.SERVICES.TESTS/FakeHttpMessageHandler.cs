using System.Net;

namespace UIS.SERVICES.TESTS;

public class FakeHttpMessageHandler: HttpMessageHandler
{
    public virtual HttpResponseMessage Send(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        // You can customize the response based on the request here
        return new HttpResponseMessage(HttpStatusCode.OK);
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Send(request, cancellationToken));
    }
}