<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;

class AdminDashboardController extends Controller
{
    public function __construct(private DashboardService $dashboard) {}

    public function index()
    {
        return $this->success($this->dashboard->forAdmin());
    }
}
