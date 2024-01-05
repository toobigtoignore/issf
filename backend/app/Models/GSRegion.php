<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GSRegion extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'gs_region';
    protected $with = ['countries', 'region'];

    public $timestamps = false;


    public function countries(){
        return $this->hasMany(RegionCountry::class, 'region_id', 'id');
    }


    public function region(){
        return $this->belongsTo(Region::class, 'region_id');
    }
}
