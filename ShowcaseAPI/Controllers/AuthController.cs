using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ShowcaseAPI.Data;
using ShowcaseAPI.Data.Entities;
using ShowcaseAPI.DTOs;
using ShowcaseAPI.Models;
using ShowcaseAPI.Services;

namespace ShowcaseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwtService;
        private readonly PasswordHasher<User> _hasher = new();

        public AuthController(AppDbContext db, JwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existingUser = _db.Users
                .FirstOrDefault(u => u.UserName == dto.UserName);

            if (existingUser != null)
            {
                return BadRequest("Username already exists.");
            }

            var user = new User
            {
                UserName = dto.UserName,
                Role = "User"
            };

            var passwordHasher = new PasswordHasher<User>();

            user.PasswordHash = passwordHasher.HashPassword(
                user,
                dto.Password
            );

            _db.Users.Add(user);

            await _db.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _db.Users.FirstOrDefault(x => x.UserName == dto.UserName);

            if (user == null)
                return Unauthorized("Invalid username or password");

            var result = _hasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                dto.Password
            );

            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Invalid username or password");

            var token = _jwtService.CreateToken(user);

            return Ok(new
            {
                token
            });
        }
    }

}
