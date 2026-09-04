<?php

// app/Traits/ApiResponse.php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $code
     * @return JsonResponse
     */
    public function sendResponse($data, $message, $code = 200)
    {
        return response()->json([
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * @param  string  $message
     * @param  int  $code
     * @param  mixed  $errors
     * @return JsonResponse
     */
    public function sendError($message, $code = 500, $errors = null)
    {
        $response = [
            'code' => $code,
            'message' => $message,
            'data' => null,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
