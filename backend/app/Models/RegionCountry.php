<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegionCountry extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'gs_region_country';

    public $timestamps = false;


    public function gs_region(){
        return $this->belongsTo(GSRegion::class, 'region_id');
    }
}
