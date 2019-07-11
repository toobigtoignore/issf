/* Apply required fields to have range */
UPDATE public.attribute SET attribute_type='Ordinal', attribute_label='Weakest and most powerful motor', additional_field='Horsepower', additional_field_type='Integer' WHERE question_number='6C';
INSERT INTO public.attribute_value(attribute_id, value_label, value_order) VALUES (3, 'None in Use', 1), 
                                                                                  (3, 'Not applicable', 2),
                                                                                  (3, 'Gas or Electric Engines', 3),
                                                                                  (23, 'Other', 7);

/* Value column must be converted to string, so we drop the old main_attributes view as it cannot point to something we're modifying */ 
DROP VIEW main_attributes;

/* Actually modify the table, automatically converts integer -> string */
ALTER TABLE public.selected_attribute ALTER COLUMN value SET DATA TYPE text;
ALTER TABLE public.selected_attribute ALTER COLUMN additional SET DATA TYPE text;

/* Allow ranges for landings too */
ALTER TABLE public.species ALTER COLUMN landings SET DATA TYPE text;

ALTER TABLE public.profile_organization ADD COLUMN organization_type_other_text text;

/* Recreate the view using the same code as before, copied verbatim from old DB */
CREATE VIEW main_attributes AS WITH all_main_attributes AS (
         SELECT profile.issf_core_id,
            attribute.attribute_id,
            attribute.label_order
           FROM ( SELECT ssf_profile.issf_core_id
                   FROM ssf_profile) profile,
            attribute
          WHERE attribute.attribute_category = 'Main'::text OR attribute.attribute_category = 'Common'::text
        )
 SELECT
        CASE
            WHEN selected_attribute.selected_attribute_id IS NOT NULL THEN selected_attribute.selected_attribute_id::bigint
            ELSE row_number() OVER (ORDER BY all_main_attributes.label_order, attribute_value.value_order)
        END AS row_number,
    selected_attribute.selected_attribute_id,
    all_main_attributes.issf_core_id,
    all_main_attributes.attribute_id,
    selected_attribute.value,
    selected_attribute.attribute_value_id,
    selected_attribute.other_value,
    selected_attribute.additional,
    selected_attribute.additional_value_id,
    all_main_attributes.label_order,
    attribute_value.value_order
   FROM selected_attribute
     RIGHT JOIN all_main_attributes ON selected_attribute.attribute_id = all_main_attributes.attribute_id AND selected_attribute.issf_core_id = all_main_attributes.issf_core_id
     LEFT JOIN attribute_value ON selected_attribute.attribute_value_id = attribute_value.attribute_value_id
     LEFT JOIN additional_value ON selected_attribute.additional_value_id = additional_value.additional_value_id
  
  ORDER BY all_main_attributes.label_order, attribute_value.value_order;

CREATE RULE main_attribute_delete AS
    ON DELETE TO public.main_attributes DO INSTEAD  DELETE FROM public.selected_attribute
  WHERE (selected_attribute.selected_attribute_id = old.selected_attribute_id);

CREATE RULE main_attribute_insert AS
    ON INSERT TO public.main_attributes DO INSTEAD  INSERT INTO public.selected_attribute (issf_core_id, attribute_id, value, attribute_value_id, other_value, additional, additional_value_id)
  VALUES (new.issf_core_id, new.attribute_id, new.value, new.attribute_value_id, new.other_value, new.additional, new.additional_value_id);

CREATE RULE main_attribute_update AS
    ON UPDATE TO public.main_attributes DO INSTEAD  UPDATE public.selected_attribute SET value = new.value, attribute_value_id = new.attribute_value_id, other_value = new.other_value, additional = new.additional, additional_value_id = new.additional_value_id
  WHERE (selected_attribute.selected_attribute_id = new.selected_attribute_id);
