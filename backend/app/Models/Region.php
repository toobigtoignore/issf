<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Region extends Model
{
    use HasFactory;
    use HasSpatial;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'region';

    public $timestamps = false;

    protected $casts = [
        'region_point' => Point::class
    ];
}
