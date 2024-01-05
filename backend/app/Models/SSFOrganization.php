<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class SSFOrganization extends Model
{
    use HasFactory;
    use HasSpatial;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_organization';
    protected $with = ['core','organization_country'];
    public $timestamps = false;

    protected $casts = [
        'organization_point' => Point::class
    ];

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }

    public function organization_country(){
        return $this->belongsTo(Country::class, 'country_id');
    }
}
