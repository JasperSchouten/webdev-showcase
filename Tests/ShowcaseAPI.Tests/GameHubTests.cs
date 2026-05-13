//csharp tests/ShowcaseAPI.Tests/GameHubTests.cs
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR;
using Moq;
using ShowcaseAPI.Hubs;
using ShowcaseAPI.Models;
using ShowcaseAPI.Services;
using Xunit;

namespace ShowcaseAPI.Tests
{
    public class GameHubTests
    {

        //uitleg: helper functie om properties te kunnen assignen, want in het "echt" kan je geen properties zelf assignen, maar dit moet wel voor een test
        // het werkt dus als ga in dit hub object, naar de property met deze naam, en zet het naar 'dit'.
        private static void SetHubProperty(object hub, string propName, object value)
        {
            var prop = hub.GetType().GetProperty(propName, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic);
            prop.Should().NotBeNull($"Property {propName} not found on hub");
            prop.SetValue(hub, value);
        }

        

        [Fact]
        public async Task GameHub_CreateGame_CallsCreateGame_And_NotifiesCaller()
        {
            var mockSvc = new Mock<IGameService>(); //gameservice mocken
            var game = new Game { GameCode = "ABC123", Player1Id = "p1", Player1Name = "Alice" };//test game object aanmaken
            mockSvc.Setup(s => s.CreateGame(It.IsAny<string>(), It.IsAny<string>())).Returns(game);//returned de test game object als iets create game aanroept

            var hub = new GameHub(mockSvc.Object); //een "echte hub" met de neppe service erin
           
            var mockContext = new Mock<HubCallerContext>();  // neppe connection context
                                                             
            mockContext.Setup(c => c.User).Returns(new ClaimsPrincipal(new ClaimsIdentity(new[] {  //geuthenticeerde gebruiker met claims:
                new Claim(ClaimTypes.NameIdentifier, "p1"),
                new Claim(ClaimTypes.Name, "Alice")
            }, "test")));
            mockContext.Setup(c => c.ConnectionId).Returns("conn-1"); //fake connection id

            SetHubProperty(hub, "Context", mockContext.Object); //injecteer de neppe context

            // mock groups
            var mockGroups = new Mock<IGroupManager>();
            mockGroups.Setup(g => g.AddToGroupAsync(
                    It.IsAny<string>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask)
                .Verifiable();
            SetHubProperty(hub, "Groups", mockGroups.Object);

            // mock clients
            var callerProxy = new Mock<ISingleClientProxy>(); //dit is zegmaar een mock van "de browser die de hub methdoe heeft gecalled"
            callerProxy.Setup(p => p.SendCoreAsync(
                "GameCreated",
                It.IsAny<object[]>(),
                default
            ))
                .Returns(Task.CompletedTask)
                .Verifiable();

            var clients = new Mock<IHubCallerClients>();
            clients.Setup(c => c.Caller).Returns(callerProxy.Object);
            SetHubProperty(hub, "Clients", clients.Object);

            // Act
            await hub.CreateGame();

            // Assert
            mockGroups.Verify(g => g.AddToGroupAsync( //was de groep toegevoegd?
                    "conn-1",
                    "ABC123",
                    It.IsAny<CancellationToken>()),
                Times.Once);
            callerProxy.Verify();                    // was de caller genotified?
            mockSvc.Verify(s => s.CreateGame("p1", "Alice"), Times.Once); // is de service gecalled?
        }

        [Fact]
        public async Task GameHub_JoinGame_PlayerJoinedFlow_VerifySendToGroup()
        {
            var mockSvc = new Mock<IGameService>();

            var g = new Game { GameCode = "CODE1", Player1Id = "p1", Player1Name = "Alice" };
            // Simulate that caller is not player1 and joining fills player2
            mockSvc.Setup(s => s.GetGame("CODE1")).Returns(g);
            mockSvc.Setup(s => s.JoinGame("CODE1", "p2", "Bob"))
                .Returns(() =>
                {
                    g.Player2Id = "p2";
                    g.Player2Name = "Bob";
                    return g;
                });

            var hub = new GameHub(mockSvc.Object);

            // mock context
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User).Returns(new ClaimsPrincipal(new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, "p2"),
                new Claim(ClaimTypes.Name, "Bob")
            }, "test")));
            mockContext.Setup(c => c.ConnectionId).Returns("conn-2");

            SetHubProperty(hub, "Context", mockContext.Object);

            // mock groups
            var mockGroups = new Mock<IGroupManager>();
            mockGroups.Setup(gm => gm.AddToGroupAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask)
                .Verifiable();
            SetHubProperty(hub, "Groups", mockGroups.Object);

            // mock clients for group notifications
            var groupProxy = new Mock<IClientProxy>();
            groupProxy.Setup(p => p.SendCoreAsync("PlayerJoined", It.IsAny<object[]>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask)
                .Verifiable();
            groupProxy.Setup(p => p.SendCoreAsync("GameUpdated", It.IsAny<object[]>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask)
                .Verifiable();

            var clients = new Mock<IHubCallerClients>();
            clients.Setup(c => c.Group("CODE1")).Returns(groupProxy.Object);
            SetHubProperty(hub, "Clients", clients.Object);

            // Act
            await hub.JoinGame("CODE1");

            // Assert
            mockGroups.Verify(g => g.AddToGroupAsync("conn-2", "CODE1", It.IsAny<CancellationToken>()), Times.Once);
            groupProxy.Verify(p => p.SendCoreAsync("PlayerJoined", It.IsAny<object[]>(), It.IsAny<CancellationToken>()), Times.Once);
            groupProxy.Verify(p => p.SendCoreAsync("GameUpdated", It.IsAny<object[]>(), It.IsAny<CancellationToken>()), Times.Once);
            mockSvc.Verify(s => s.GetGame("CODE1"), Times.Once);
            mockSvc.Verify(s => s.JoinGame("CODE1", "p2", "Bob"), Times.Once);
        }
    }
}