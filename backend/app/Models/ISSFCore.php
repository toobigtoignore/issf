<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class ISSFCore extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'issf_core_id';
    protected $table = 'issf_core';
    public $timestamps = false;
    protected $with = ['user'];

    public function user(){
        return $this->belongsTo(UserProfile::class, 'contributor_id');
    }

    public function person_record(){
        return $this->hasMany(SSFPerson::class);
    }
}
