# Troubleshooting

## PostgreSQL connection failures

Check `docker compose ps` and `docker compose logs db`. Confirm the values in
`.env` match and that the database health check becomes healthy. The backend
uses the Compose DNS name `db`, not `localhost`.

## Django migration failures

Read `docker compose logs backend`. The entrypoint intentionally exits if
`python manage.py migrate --noinput` fails. Correct the database or migration
error, then run `docker compose up -d --build backend`.

## Nginx 502 Bad Gateway

Check that both upstreams are healthy with `docker compose ps`, and inspect
`docker compose logs nginx backend frontend`. Nginx resolves upstreams by
Compose service name on the application network.

## React API connection failures

Browser requests must use `/api/` relative paths. Check the backend health
endpoint at `http://localhost/api/health/` and inspect the browser network tab.
The browser must not call `backend:8000` directly.

## Docker port conflicts

Only Nginx publishes port 80. If it is occupied, stop the conflicting service
or change the host side of the `80:80` mapping in `docker-compose.yml`.

## Container startup failures

Inspect `docker compose logs -f` and `docker compose ps`. Validate Compose
configuration with `docker compose config -q`, and rebuild after Dockerfile or
dependency changes using `docker compose up -d --build`.
