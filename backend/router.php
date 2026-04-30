<?php
declare(strict_types=1);

const CONTENT_FILE = '/app/data/content.json';

function jsonResponse(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function isValidSiteData(mixed $payload): bool
{
    if (!is_array($payload)) {
        return false;
    }

    if (!array_key_exists('staticPages', $payload) || !is_array($payload['staticPages'])) {
        return false;
    }

    if (!array_key_exists('landingPages', $payload) || !is_array($payload['landingPages'])) {
        return false;
    }

    return true;
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
if ($path !== '/api/content') {
    jsonResponse(404, ['ok' => false, 'error' => 'Not found']);
    return;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    if (!is_file(CONTENT_FILE)) {
        jsonResponse(404, ['ok' => false, 'error' => 'Content not initialized']);
        return;
    }

    $raw = file_get_contents(CONTENT_FILE);
    if ($raw === false) {
        jsonResponse(500, ['ok' => false, 'error' => 'Failed to read content file']);
        return;
    }

    try {
        $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (Throwable $e) {
        jsonResponse(500, ['ok' => false, 'error' => 'Invalid content file']);
        return;
    }

    if (!isValidSiteData($payload)) {
        jsonResponse(500, ['ok' => false, 'error' => 'Content file has invalid structure']);
        return;
    }

    jsonResponse(200, $payload);
    return;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        jsonResponse(400, ['ok' => false, 'error' => 'Missing JSON body']);
        return;
    }

    try {
        $payload = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
    } catch (Throwable $e) {
        jsonResponse(400, ['ok' => false, 'error' => 'Invalid JSON body']);
        return;
    }

    if (!isValidSiteData($payload)) {
        jsonResponse(400, ['ok' => false, 'error' => 'Invalid payload structure']);
        return;
    }

    $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        jsonResponse(500, ['ok' => false, 'error' => 'Failed to encode content']);
        return;
    }

    $dir = dirname(CONTENT_FILE);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        jsonResponse(500, ['ok' => false, 'error' => 'Cannot create data directory']);
        return;
    }

    if (is_file(CONTENT_FILE)) {
        @copy(CONTENT_FILE, CONTENT_FILE . '.bak');
    }

    $tmpFile = CONTENT_FILE . '.tmp';
    if (file_put_contents($tmpFile, $encoded . PHP_EOL, LOCK_EX) === false) {
        jsonResponse(500, ['ok' => false, 'error' => 'Failed to write temp content file']);
        return;
    }

    if (!rename($tmpFile, CONTENT_FILE)) {
        @unlink($tmpFile);
        jsonResponse(500, ['ok' => false, 'error' => 'Failed to finalize content file']);
        return;
    }

    jsonResponse(200, ['ok' => true]);
    return;
}

jsonResponse(405, ['ok' => false, 'error' => 'Method not allowed']);
