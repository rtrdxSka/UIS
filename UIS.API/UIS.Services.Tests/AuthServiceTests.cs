using System.Text.Json;
using UIS.DAL.DTO;
using UIS.Services.Auth;

namespace UIS.Services.Tests;

public class AuthServiceTests
{
    private readonly AuthService _sut = new();

    [Fact]
    public async Task Test_GetTokenAsync_DeserializeResponse()
    {
        using var httpClient = new HttpClient();
        var response = await _sut.GetTokenAsync(httpClient, "3c54b1b2a1beef4de9b7aa367c1608ed0091cc530b6e8572");
        var content = await response.Content.ReadAsStringAsync();

        var moodleTokenDto = JsonSerializer.Deserialize<MoodleTokenDTO>(content);
        Assert.NotNull(moodleTokenDto);
        Assert.NotNull(moodleTokenDto.RefreshToken);
        Assert.NotNull(moodleTokenDto.AccessToken);
        Assert.NotNull(moodleTokenDto.TokenType);
        Assert.NotNull(moodleTokenDto.Scope);
        Assert.NotEqual(0, moodleTokenDto.ExpiresIn);
    }

    [Fact]
    public async Task Test_GetUserInfoAsync_DeserializeResponse()
    {
        using var httpClient = new HttpClient();

        var responseToken = await _sut.GetTokenAsync(httpClient, "3c54b1b2a1beef4de9b7aa367c1608ed0091cc530b6e8572");
        var contentToken = await responseToken.Content.ReadAsStringAsync();

        var response = await _sut.GetUserInfoAsync(httpClient, JsonSerializer.Deserialize<MoodleTokenDTO>(contentToken)!);
        var content = await response.Content.ReadAsStringAsync();

        var userInfoDto = JsonSerializer.Deserialize<UserInfoDTO>(content);
        Assert.NotNull(userInfoDto);
        Assert.NotNull(userInfoDto.id);
        Assert.NotNull(userInfoDto.username);
        Assert.NotNull(userInfoDto.address);
        Assert.NotNull(userInfoDto.email);
        Assert.NotNull(userInfoDto.lang);
        Assert.NotNull(userInfoDto.auth);
        Assert.NotNull(userInfoDto.country);
        Assert.NotNull(userInfoDto.description);
        Assert.NotNull(userInfoDto.firstname);
        Assert.NotNull(userInfoDto.lastname);
        Assert.NotNull(userInfoDto.phone1);
    }
}