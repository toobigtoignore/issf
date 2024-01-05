<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    use HasFactory;

    protected $fillable = [];
    protected $primaryKey = 'id';
    protected $table = 'languages';

    public $timestamps = false;
}
