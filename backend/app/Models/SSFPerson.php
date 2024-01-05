<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use MatanYadaev\EloquentSpatial\Objects\Point;
use MatanYadaev\EloquentSpatial\Traits\HasSpatial;

class SSFPerson extends Model
{
    use HasFactory;
    use HasSpatial;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_person';
    protected $with = ['core', 'ssf_country'];
    public $timestamps = false;

    protected $casts = [
        'person_point' => Point::class
    ];

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }

    public function organizations(){
        return $this->hasMany(PersonOrganization::class);
    }

    public function ssf_country(){
        return $this->belongsTo(Country::class, 'country_id');
    }
}
