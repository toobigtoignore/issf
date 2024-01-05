<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GSNational extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'gs_national';
    protected $with = ['country'];

    public $timestamps = false;


    public function country(){
        return $this->belongsTo(Country::class, 'country_id');
    }
}
