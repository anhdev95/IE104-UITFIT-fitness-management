<?php

namespace App\Http\Controllers;

use App\Http\Requests\Health\StoreHealthRecordRequest;
use App\Http\Resources\HealthRecordResource;
use App\Models\HealthRecord;
use App\Services\HealthService;
use Illuminate\Http\Request;

class HealthRecordController extends Controller
{
    public function __construct(private HealthService $health) {}

    public function index(Request $request)
    {
        $records = $request->user()->healthRecords()
            ->orderByDesc('record_date')
            ->orderByDesc('id')
            ->get();

        return $this->success(HealthRecordResource::collection($records));
    }

    public function store(StoreHealthRecordRequest $request)
    {
        $record = $this->health->store($request->user(), $request->validated());

        return $this->success(new HealthRecordResource($record), 'Đã lưu chỉ số cơ thể', 201);
    }

    public function show(HealthRecord $healthRecord)
    {
        $this->ensureOwner($healthRecord);

        return $this->success(new HealthRecordResource($healthRecord));
    }

    public function destroy(HealthRecord $healthRecord)
    {
        $this->ensureOwner($healthRecord);
        $this->health->delete($healthRecord);

        return $this->success(null, 'Đã xóa bản ghi chỉ số');
    }
}
