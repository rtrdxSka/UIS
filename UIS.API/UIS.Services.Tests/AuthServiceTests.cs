using System.Text.Json;
using UIS.DAL.DTO;
using UIS.Services.Auth;
using UIS.Services.Tests.Mocks;

namespace UIS.Services.Tests;

public class AuthServiceTests
{
    private readonly AuthService _sut = new();

    [Fact]
    public async Task Test_GetTokenAsync_DeserializeResponse()
    {
        var moodleTockenDtoMock = new MoodleTokenDTO
        {
            RefreshToken = nameof(MoodleTokenDTO.RefreshToken),
            AccessToken = nameof(MoodleTokenDTO.AccessToken),
            TokenType = nameof(MoodleTokenDTO.TokenType),
            Scope = nameof(MoodleTokenDTO.Scope),
            ExpiresIn = int.MaxValue,
        };

        var responeMock = new HttpResponseMessage
        {
            Content = new StringContent(JsonSerializer.Serialize(moodleTockenDtoMock)),
        };

        string content;
        using (var httpClientMock = new HttpClientMock(responeMock))
        using (var response = await _sut.GetTokenAsync(httpClientMock, ""))
            content = await response.Content.ReadAsStringAsync();

        var moodleTokenDto = JsonSerializer.Deserialize<MoodleTokenDTO>(content);

        Assert.NotNull(moodleTokenDto);
        Assert.Equal(moodleTockenDtoMock.RefreshToken, moodleTokenDto.RefreshToken);
        Assert.Equal(moodleTockenDtoMock.AccessToken, moodleTokenDto.AccessToken);
        Assert.Equal(moodleTockenDtoMock.TokenType, moodleTokenDto.TokenType);
        Assert.Equal(moodleTockenDtoMock.Scope, moodleTokenDto.Scope);
        Assert.Equal(moodleTockenDtoMock.ExpiresIn, moodleTokenDto.ExpiresIn);
    }

    [Fact]
    public async Task Test_GetUserInfoAsync_DeserializeResponse()
    {
        var userInfoDtoMock = new UserInfoDTO
        {
            id = nameof(UserInfoDTO.id),
            username = nameof(UserInfoDTO.username),
            address = nameof(UserInfoDTO.address),
            email = nameof(UserInfoDTO.email),
            lang = nameof(UserInfoDTO.lang),
            auth = nameof(UserInfoDTO.auth),
            country = nameof(UserInfoDTO.country),
            description = nameof(UserInfoDTO.description),
            firstname = nameof(UserInfoDTO.firstname),
            lastname = nameof(UserInfoDTO.lastname),
            phone1 = nameof(UserInfoDTO.phone1),
            idnumber = nameof(UserInfoDTO.idnumber),
        };

        var responeMock = new HttpResponseMessage
        {
            Content = new StringContent(JsonSerializer.Serialize(userInfoDtoMock)),
        };

        string content;
        using (var httpClient = new HttpClientMock(responeMock))
        using (var response = await _sut.GetUserInfoAsync(httpClient, new MoodleTokenDTO()))
            content = await response.Content.ReadAsStringAsync();

        var userInfoDto = JsonSerializer.Deserialize<UserInfoDTO>(content);

        Assert.NotNull(userInfoDto);
        Assert.Equal(userInfoDtoMock.id, userInfoDto.id);
        Assert.Equal(userInfoDtoMock.username, userInfoDto.username);
        Assert.Equal(userInfoDtoMock.address, userInfoDto.address);
        Assert.Equal(userInfoDtoMock.email, userInfoDto.email);
        Assert.Equal(userInfoDtoMock.lang, userInfoDto.lang);
        Assert.Equal(userInfoDtoMock.auth, userInfoDto.auth);
        Assert.Equal(userInfoDtoMock.country, userInfoDto.country);
        Assert.Equal(userInfoDtoMock.description, userInfoDto.description);
        Assert.Equal(userInfoDtoMock.firstname, userInfoDto.firstname);
        Assert.Equal(userInfoDtoMock.lastname, userInfoDto.lastname);
        Assert.Equal(userInfoDtoMock.phone1, userInfoDto.phone1);
        Assert.Equal(userInfoDtoMock.idnumber, userInfoDto.idnumber);
    }
}