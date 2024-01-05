<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class Country extends Model
{
    use HasFactory;
    use HasSpatial;

    protected $fillable = [];
    protected $primaryKey = 'country_id';
    protected $table = 'country';

    protected $casts = [
        'country_point' => Point::class
    ];
}
