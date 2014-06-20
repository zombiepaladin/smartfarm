module IoPanelHelper

  def io_panel(input_fields, output_fields)
    snippet = ""

    input_head = content_tag :h3, "Model Inputs", class: "panel-title"
    input_head = content_tag :div, input_head, class: "panel-heading"
    input_body = create_fields(input_fields)
    input_panel = content_tag :div, (input_head.html_safe + input_body.html_safe), class: "panel panel-info"
    snippet += content_tag :div, input_panel.html_safe, class: "col-md-6"

    output_head = content_tag :h3, "Model Outputs", class: "panel-title"
    output_head = content_tag :div, output_head, class: "panel-heading"
    output_body = create_fields(output_fields)
    output_panel = content_tag :div, (output_head.html_safe + output_body.html_safe), class: "panel panel-success"
    snippet += content_tag :div, output_panel.html_safe, class: "col-md-6"
    
    content_tag :div, snippet.html_safe, class: "row"
  end

private

  def create_fields(field_names)
    output = []
    for name in field_names
      snippet = label_tag name.underscore, name.titleize
      snippet += text_field_tag name.underscore
      snippet = content_tag :div, snippet, class: "form-group"
      output << snippet
    end
    output.join("\n")
  end

end


