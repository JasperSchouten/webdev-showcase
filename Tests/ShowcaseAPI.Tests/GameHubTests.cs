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
        private static void SetHubProperty(object hub, string propName, object value)
        {
            var prop = hub.GetType().GetProperty(propName, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic);
            prop.Should().NotBeNull($"Property {propName} not found on hub");
            prop.SetValue(hub, value);
        }

        [Fact]
        public async Task GameHub_CreateGame_CallsCreateGame_And_NotifiesCaller()
        {
            var mockSvc = new Mock<IGameService>();
            var game = new Game { GameCode = "ABC123", Player1Id = "p1", Player1Name = "Alice" };
            mockSvc.Setup(s => s.CreateGame(It.IsAny<string>(), It.IsAny<string>())).Returns(game);

            var hub = new GameHub(mockSvc.Object);

            // mock context
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User).Returns(new ClaimsPrincipal(new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.NameIdentifier, "p1"),
                new Claim(ClaimTypes.Name, "Alice")
            }, "test")));
            mockContext.Setup(c => c.ConnectionId).Returns("conn-1");

            SetHubProperty(hub, "Context", mockContext.Object);

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
            var callerProxy = new Mock<ISingleClientProxy>();
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
            mockGroups.Verify(g => g.AddToGroupAsync(
                    "conn-1",
                    "ABC123",
                    It.IsAny<CancellationToken>()),
                Times.Once);
            callerProxy.Verify();
            mockSvc.Verify(s => s.CreateGame("p1", "Alice"), Times.Once);
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