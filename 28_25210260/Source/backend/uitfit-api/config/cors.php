<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // Angular dev server (ng serve)
    'allowed_origins' => array_filter(explode(',', env('FRONTEND_URL', 'http://localhost:4200'))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
