<?php

namespace App\Http\Controllers;

use App\Services\StatisticsService;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function __construct(private StatisticsService $statistics) {}

    /** GET /api/statistics/health?range=7d|30d|3m|6m|1y */
    public function health(Request $request)
    {
        return $this->success($this->statistics->health($request->user(), (string) $request->input('range', '30d')));
    }

    public function workouts(Request $request)
    {
        return $this->success($this->statistics->workouts($request->user()));
    }
}
