<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelectedAttribute extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $primaryKey = 'id';
    protected $table = 'selected_attribute';
    protected $with = ['category', 'label'];

    public $timestamps = false;


    public function category(){
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }


    public function label(){
        return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
    }
}
