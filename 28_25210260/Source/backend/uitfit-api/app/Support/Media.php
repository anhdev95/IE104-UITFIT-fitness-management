<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Media
{
    /**
     * Trả về URL đầy đủ cho ảnh: giữ nguyên URL tuyệt đối, chuyển path lưu trên disk public thành URL.
     */
    public static function url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        if (Str::startsWith($path, ['http://', 'https://', 'data:'])) {
            return $path;
        }

        // Ảnh mặc định nằm trong public/images (seed), ảnh upload nằm trong storage/app/public
        if (Str::startsWith($path, 'images/')) {
            return asset($path);
        }

        return Storage::disk('public')->url($path);
    }
}
