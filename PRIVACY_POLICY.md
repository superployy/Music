# Privacy Policy

**Last updated:** 2024

## What We Collect

discord-musicbot stores the **minimum data required** to function:

| Data | Purpose | Retention |
|------|---------|-----------|
| Discord Guild ID | Persisting language preference per server | Until you run `/language` and change it, or delete the database |
| Language preference (`en`, `fr`, etc.) | Display bot responses in your server's language | Until changed or deleted |

We do **not** collect:
- User IDs, usernames, or account details
- Message content
- Voice data or audio streams
- IP addresses
- Any personally identifiable information (PII)

## Where Data Is Stored

All data is stored **locally** in the `database/data.json` file on the machine running the bot. No data is sent to third-party servers except for the audio streaming services used for playback (YouTube, Spotify, SoundCloud).

## Third-Party Services

Playback relies on these external APIs:
- **YouTube** — subject to [Google's Privacy Policy](https://policies.google.com/privacy)
- **Spotify** — subject to [Spotify's Privacy Policy](https://www.spotify.com/legal/privacy-policy/)
- **SoundCloud** — subject to [SoundCloud's Privacy Policy](https://soundcloud.com/pages/privacy)

## Data Deletion

To delete all stored data for your server, a server administrator can delete the `database/data.json` file, or remove the relevant guild entry manually. There is no personal data to request deletion of.

## Contact

If you have questions about data handling, open an issue in the project repository.
