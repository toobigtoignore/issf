<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class SSFGuideline extends Model
{
    use HasFactory;
    use HasSpatial;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_guidelines';
    protected $with = ['core','ssfguideline_country'];
    public $timestamps = false;

    protected $casts = [
        'guidelines_point' => Point::class
    ];

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }

    public function ssfguideline_country(){
        return $this->belongsTo(Country::class, 'country_id');
    }
}
