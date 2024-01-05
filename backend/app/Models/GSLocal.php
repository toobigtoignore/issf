<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class GSLocal extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'gs_local';
    protected $with = ['country'];

    public $timestamps = false;

    protected $casts = [
        'area_point' => Point::class
    ];


    public function country(){
        return $this->belongsTo(Country::class, 'country_id');
    }
}
