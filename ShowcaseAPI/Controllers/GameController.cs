using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ShowcaseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        [Authorize(Roles = "User")]
        [HttpGet("secure")]
        public IActionResult TestEndpoint()
        {
            return Ok("You are authenticated");
        }

    }
}
