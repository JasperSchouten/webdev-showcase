using System.Net;
using System.Net.Mail;
using Microsoft.AspNetCore.Mvc;
using ShowcaseAPI.Models;

namespace ShowcaseAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public MailController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        public ActionResult Post([Bind("FirstName, LastName, Email, Phone")] ContactFormDto form)
        {
            var host = _configuration["Mailtrap:Host"];
            var port = int.Parse(_configuration["Mailtrap:Port"]!);
            var user = _configuration["Mailtrap:User"];
            var password = _configuration["Mailtrap:Password"];
            var from = _configuration["Mailtrap:From"];
            var to = _configuration["Mailtrap:To"];

            var subject = "Contactverzoek";

            var body = $@"
Een bezoeker met de volgende gegevens heeft een contactverzoek gedaan:

Voornaam: {form.FirstName}
Achternaam: {form.LastName}
Email: {form.Email}
Telefoonnummer: {form.Phone}
";

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, password),
                EnableSsl = true
            };

            client.Send(from, to, subject, body);

            Console.WriteLine("Sent");

            return Ok();
        }
    }
}