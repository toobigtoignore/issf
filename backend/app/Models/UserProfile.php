<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class UserProfile extends Authenticatable
{
    use HasFactory;

    protected $guarded = [];
    protected $table = 'user_profile';
    protected $primaryKey = 'id';
    protected $with = ['country'];
    public $timestamps = false;

    protected $casts = [
        'password' => 'hashed'
    ];
    protected $hidden = [
        'password',
        'last_login',
        'is_active'
    ];

    public function country(){
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function records(){
        return $this->hasMany(ISSFCore::class);
    }
}
