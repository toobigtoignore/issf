<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SSFBluejustice extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'ssf_bluejustice';
    protected $with = ['core', 'ssf_country'];
    public $timestamps = false;

    public function core(){
        return $this->belongsTo(ISSFCore::class, 'issf_core_id');
    }

    public function ssf_country(){
        return $this->belongsTo(Country::class, 'ssf_country');
    }
}
