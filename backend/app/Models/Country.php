<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;
use App\Models\Region;

class Country extends Model
{
    use HasFactory;
    use HasSpatial;

    public $timestamps = false;
    protected $fillable = [];
    protected $primaryKey = 'country_id';
    protected $table = 'country';
    protected $with = ['region'];

    protected $casts = [
        'country_point' => Point::class
    ];


    public function region(){
        return $this->belongsTo(Region::class, 'region_id');
    }
}
