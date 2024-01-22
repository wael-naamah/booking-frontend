import React from "react";
import { connect } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateCategoryRequest, deleteCategoryRequest } from "../../../redux/actions";
import {
    selectCategories,
    selectCategoriesLoading,
    selectDeleteCategoryLoading,
    selectUpdateCategoryLoading,
} from "../../../redux/selectors";
import { Category, Service, SortDirection } from "../../../Schema";
import { ThunkDispatch } from "@reduxjs/toolkit";
import {
    Row,
    Col,
    Table,
    Collapse,
    Tabs,
    Switch,
    Input,
    Select,
    Button,
    message,
    Popconfirm,
    Modal,
    Divider,
    Upload,
    Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withAuthorization from "../../../HOC/withAuthorization";
import "./index.css";
import { RcFile } from "antd/es/upload";
import { upload } from "../../../utils";
import { FILES_STORE } from "../../../redux/network/api";

const { Panel } = Collapse;
const { TextArea } = Input;
const { Column } = Table;
const { Option } = Select;

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    weekStart: 1,
});

interface ICategoryState {
    editingTitle: number | null;
    localCategory: Category;
    visible: boolean;
    newService: Service;
    file?: RcFile;
    fileLoading: boolean,
    editingServiceIndex: number | null;
}

interface ICategoryProps {
    loading: boolean;
    category: Category;
    index: number;
    updateCategoryLoading: boolean;
    deleteCategoryLoading: boolean;
    updateCategoryRequest: (id: string, category: Category) => Promise<any>;
    deleteCategoryRequest: (id: string) => Promise<any>;
}

class CategoryPage extends React.Component<ICategoryProps, ICategoryState> {
    constructor(props: ICategoryProps) {
        super(props);
        this.state = {
            editingTitle: null,
            localCategory: props.category,
            visible: false,
            newService: {
                name: '',
                description: '',
                duration: 60,
                price: 0,
                abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                attachment: undefined
            },
            fileLoading: false,
            editingServiceIndex: null
        };
    }

    onUpdateCategory = () => {
        const { localCategory } = this.state;
        const updateCategory = Object.assign({}, localCategory);

        delete updateCategory._id;
        delete updateCategory.createdAt;
        delete updateCategory.updatedAt;


        this.props.updateCategoryRequest(localCategory._id!, updateCategory).then(data => {
            if (data._id) {
                message.success('Successfully updated the category')
            } else {
                message.error('Something went wrong. please try again')
            }
        })
    };

    onDeleteCategory = () => {
        const { localCategory } = this.state;

        this.props.deleteCategoryRequest(localCategory._id!).then(data => {
            if (data.status && data.status === "success") {
                message.success('Successfully deleted the category')
            } else {
                message.error('Something went wrong. please try again')
            }
        })
    };

    renderServices = () => {
        const { localCategory, visible, newService, file, fileLoading, editingServiceIndex } = this.state;

        const isEditing = typeof editingServiceIndex === 'number';
        const modelTitle = editingServiceIndex ? "Edit service" : "New service";

        const onClose = () => {
            this.setState({ 
                visible: false,
                newService: {
                    name: '',
                    description: '',
                    duration: 60,
                    price: 0,
                    abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                    attachment: undefined
                },
                editingServiceIndex: null
            })
        }

        const onOpen = () => {
            this.setState({ visible: true })
        }

        const setFile = (file?: RcFile) => {
            this.setState({ file })
        }

        const onSave = async () => {
            if (!newService.name) {
                message.error('Please add service name')
                return;
            }
            if (!newService.description) {
                message.error('Please add service description')
                return;
            }
            if (!newService.duration) {
                message.error('Please add service duration')
                return;
            }
            if (!newService.price) {
                message.error('Please add service price')
                return;
            }
            if (!newService.abbreviation_id) {
                message.error('Please add service abbreviation id')
                return;
            }

            let url = '';
            if (file) {
                this.setState({fileLoading: true});
                const res = await upload(file);
                url = res.uri;
            }

            if (isEditing) {
                let updatedServices = localCategory.services;
                updatedServices = localCategory.services.map((service, index) =>
                    index === editingServiceIndex
                        ? { ...newService, attachment: file ? { title: file.name, url } : undefined }
                        : service
                );

                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...updatedServices],
                    },
                    newService: {
                        name: '',
                        description: '',
                        duration: 60,
                        price: 0,
                        abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                        attachment: undefined
                    },
                    editingServiceIndex: null,
                    file: undefined,
                    fileLoading: false,
                })

            } else {
                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...this.state.localCategory.services, { ...newService, attachment: file ? { title: file.name, url } : undefined }],
                    },
                    newService: {
                        name: '',
                        description: '',
                        duration: 60,
                        price: 0,
                        abbreviation_id: Math.floor(1000 + Math.random() * 9000),
                        attachment: undefined
                    },
                    file: undefined,
                    fileLoading: false,
                })
            }


            onClose();
        }

        const onChange = (key: string, value: any) => {
            this.setState({
                newService: {
                    ...newService,
                    [key]: value
                }
            })
        };

        const onDeleteService = (id: number) => {
            const newServices = [...localCategory.services.slice(0, id), ...localCategory.services.slice(id + 1)];

            this.setState({
                localCategory: {
                    ...localCategory,
                    services: newServices
                }
            })
        };

        const onDeleteAttachment = () => {
            if (isEditing) {
                let updatedServices = localCategory.services;
                updatedServices = localCategory.services.map((service, index) =>
                    index === editingServiceIndex
                        ? { ...newService, attachment: undefined }
                        : service
                );

                this.setState({
                    localCategory: {
                        ...localCategory,
                        services: [...updatedServices]
                    },
                    newService: {
                        ...newService,
                        attachment: undefined
                    }
                })
            }
        };

        const onOpenEdit = (index: number) => {
            const initialValues: Service | undefined = localCategory.services[index];

            if (initialValues)
                this.setState({ visible: true, editingServiceIndex: index, newService: initialValues })
        }

        return (
            <div>
                <Modal
                    title={modelTitle}
                    open={visible}
                    centered
                    okText={'Save'}
                    cancelText={'Cancel'}
                    closable={false}
                    onCancel={onClose}
                    onOk={onSave}
                    confirmLoading={fileLoading}
                    width={750}
                >
                    <Divider />
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Performance</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('name', e.target.value)
                                }}
                                value={newService.name} />
                        </Col>
                    </Row>
                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Additional information</span>
                        </Col>
                        <Col span={16}>
                            <TextArea
                                onChange={(e) => {
                                    onChange('description', e.target.value)
                                }}
                                value={newService.description} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Duration (Min.)</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('duration', e.target.value)
                                }}
                                type="number"
                                value={newService.duration} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Price</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('price', e.target.value)
                                }}
                                type="number"
                                value={newService.price} />
                        </Col>
                    </Row>

                    <Row className="mb-6">
                        <Col span={8} className="w-full">
                            <span>Abbreviation ID</span>
                        </Col>
                        <Col span={16}>
                            <Input
                                onChange={(e) => {
                                    onChange('abbreviation_id', e.target.value)
                                }}
                                value={newService.abbreviation_id} />
                        </Col>
                    </Row>

                    <Row >
                        <Col span={8}>
                            <span>Image</span>
                        </Col>
                        <Col span={16} className={newService.attachment ? "mb-12" : "mb-8"}>
                            <Upload.Dragger
                                fileList={file ? [file] : []}
                                maxCount={1}
                                multiple={false}
                                onRemove={() => {
                                    setFile(undefined);
                                }}
                                disabled={Boolean(newService.attachment)}
                                beforeUpload={(file) => {
                                    setFile(file);
                                    return false;
                                }}
                            >
                                <Space size={14} align="center" className="m-0">

                                    <p className="upload-hint-label">
                                        Click or drag file to this area to
                                        upload
                                    </p>

                                </Space>
                            </Upload.Dragger>
                            {newService.attachment && <Row className="flex items-center my-2" justify={'space-between'}>
                                <Col className="flex items-center">
                                    <img src={FILES_STORE + newService.attachment.url} width={40} height={40} />
                                    <span className="ml-2">{newService.attachment.title}</span>
                                </Col>

                                <Col><DeleteOutlined onClick={() => onDeleteAttachment()} /></Col>
                            </Row>}


                        </Col>
                    </Row>
                </Modal>
                <Table
                    dataSource={localCategory.services}
                    style={{ marginTop: 20 }}
                    rowKey="_id"
                    bordered
                    footer={() => {
                        return (
                            <Button onClick={onOpen}>New Service</Button>
                        )
                    }}
                >
                    <Column title="Performance" dataIndex={"name"} />
                    <Column title="Additional information" dataIndex={"description"} />
                    <Column title="Duration (Min.)" dataIndex={"duration"} />
                    <Column title="Price" dataIndex={"price"} />
                    <Column title="Abbreviation ID" dataIndex={"abbreviation_id"} />
                    <Column
                        title="Action"
                        key="action"
                        render={(_: any, record: any, index: number) => (
                            <>
                                <Button
                                    className="self-end mr-3"
                                    type="link"
                                    onClick={() => onOpenEdit(index)}
                                >
                                    Edit
                                </Button>
                                <Popconfirm
                                    title="Delete this service?"
                                    description="Are you sure you want to delete this service?"
                                    okText="Delete It"
                                    cancelText="No"
                                    okButtonProps={{
                                        danger: true,
                                    }}
                                    onConfirm={() => onDeleteService(index)}
                                >
                                    <Button className="self-end mr-3" type="link">Delete</Button>

                                </Popconfirm>
                            </>
                        )}
                    />
                </Table>
            </div>
        );
    };

    renderAdvancedSettings = () => {
        const { localCategory } = this.state;

        const onAdvancedSettingsChange = (key: string, value: boolean | string) => {
            this.setState({
                localCategory: {
                    ...localCategory,
                    advanced_settings: {
                        ...localCategory.advanced_settings,
                        [key]: value
                    }
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Sort order</span>
                    </Col>
                    <Col span={16}>
                        <Select className="w-full" onChange={(value) => {
                            onAdvancedSettingsChange('sorting_order', value)
                        }} value={localCategory.advanced_settings?.sorting_order}>
                            {[
                                { lable: "Unsorted", value: SortDirection.NONE },
                                { lable: "Ascending", value: SortDirection.ASC },
                                { lable: "Descending", value: SortDirection.DESC },
                            ].map((el) => (
                                <Option key={el.lable} value={el.value}>
                                    {el.lable}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Show performance group in summary</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCategory.advanced_settings?.show_performance_in_summary} onChange={(value) => {
                            onAdvancedSettingsChange('show_performance_in_summary', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Show service group in e-mail confirmation to appointment provider</span>
                    </Col>
                    <Col span={16}>
                        <Switch value={localCategory.advanced_settings?.show_service_in_email} onChange={(value) => {
                            onAdvancedSettingsChange('show_service_in_email', value)
                        }} />
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Additional information Display type</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onAdvancedSettingsChange('info_display_type', value)
                        }} value={localCategory.advanced_settings?.info_display_type} className="w-full">
                            {[
                                "Tooltip",
                                "Text below the service group name",
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6" gutter={[16, 16]}>
                    <Col span={8} className="w-full">
                        <span>Show performance group on</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onAdvancedSettingsChange('show_performance_on', value)
                        }} value={localCategory.advanced_settings?.show_performance_on} className="w-full">
                            {[
                                "Page 1",
                                "Page 2",
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>
        );
    };


    renderGernal = () => {
        const { localCategory } = this.state;

        const onChange = (key: string, value: boolean | string | number) => {
            this.setState({
                localCategory: {
                    ...localCategory,
                    [key]: value
                }
            })
        };

        return (
            <div className="w-full">
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Name</span>
                    </Col>
                    <Col span={16}>
                        <Input
                            onChange={(e) => {
                                onChange('name', e.target.value)
                            }}
                            value={localCategory.name} />
                    </Col>
                </Row>

                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Category</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('category', value)
                        }}
                            value={localCategory.category} className="w-full">
                            {[
                                "Performance group",
                                "Text field (free text input)",
                                "Location select",
                                "Selection number of days",
                                "Selection number if minutes",
                                "Number search (postcode, customer number, etc...)"
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Choices</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('choices', value)
                        }}
                            value={localCategory.choices} className="w-full">
                            {[
                                "Simple selection (only one entry can be selected)",
                                "Multiple selection (multiple entries can be selected)",
                                "Selection list (only one entry can be selected)",
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Selection is optional (no entry has to be selected)</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('selection_is_optional', value)
                        }}
                            checked={localCategory.selection_is_optional} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Display price</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('show_price', value)
                        }}
                            checked={localCategory.show_price} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Show appointment duration</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('show_appointment_duration', value)
                        }}
                            checked={localCategory.show_appointment_duration} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Number of columns in the services</span>
                    </Col>
                    <Col span={16}>
                        <Select onChange={(value) => {
                            onChange('no_columns_of_services', Number(value))
                        }}
                            value={localCategory.no_columns_of_services} className="w-full">
                            {[
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                            ].map((el) => (
                                <Option key={el} value={el}>
                                    {el}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Full-screen</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('full_screen', value)
                        }}
                            checked={localCategory.full_screen} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Service group foldable</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('folded', value)
                        }}
                            checked={localCategory.folded} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Service group can be booked online</span>
                    </Col>
                    <Col span={16}>
                        <Switch onChange={(value) => {
                            onChange('online_booking', value)
                        }}
                            checked={localCategory.online_booking} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>Additional information</span>
                    </Col>
                    <Col span={16}>
                        <TextArea onChange={(e) => {
                            onChange('remarks', e.target.value)
                        }}
                            value={localCategory.remarks} />
                    </Col>
                </Row>
                <Row className="mb-6">
                    <Col span={8} className="w-full">
                        <span>ID (unique number)</span>
                    </Col>
                    <Col span={16}>
                        <Input onChange={(e) => {
                            onChange('unique_id', Number(e.target.value))
                        }}
                            type="number"
                            value={localCategory.unique_id} />
                    </Col>
                </Row>
            </div>
        );
    };

    render() {
        const { updateCategoryLoading, deleteCategoryLoading } = this.props;

        return (
            <div>
                <Row gutter={[16, 16]}>
                    <Content>
                        <Tabs
                            defaultActiveKey="1"
                            items={[
                                {
                                    key: "1",
                                    label: "General",
                                    children: this.renderGernal(),
                                },
                                {
                                    key: "2",
                                    label: "Services",
                                    children: this.renderServices(),
                                },
                                {
                                    key: "3",
                                    label: "Advanced settings",
                                    children: this.renderAdvancedSettings(),
                                },
                            ]}
                        // onChange={onChange}
                        />
                    </Content>
                </Row>
                <Row justify={'end'}>
                    <Popconfirm
                        title="Delete this category?"
                        description="Are you sure you want to delete this category?"
                        okText="Delete It"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                        }}
                        onConfirm={this.onDeleteCategory}
                    >
                        <Button loading={deleteCategoryLoading} className="self-end mr-3" type="primary" danger>Delete Category</Button>

                    </Popconfirm>
                    <Button onClick={this.onUpdateCategory} loading={updateCategoryLoading} className="self-end" type="primary">Save Changes</Button>
                </Row>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    categories: selectCategories(state),
    loading: selectCategoriesLoading(state),
    updateCategoryLoading: selectUpdateCategoryLoading(state),
    deleteCategoryLoading: selectDeleteCategoryLoading(state)
});

const mapDispatchToProps = (
    dispatch: ThunkDispatch<RootState, undefined, any>
) => ({
    updateCategoryRequest: (id: string, category: Category) => dispatch(updateCategoryRequest(id, category)),
    deleteCategoryRequest: (id: string) => dispatch(deleteCategoryRequest(id)),
});

// export default compose(
//     withAuthorization,
//   )(connect(mapStateToProps, mapDispatchToProps)(CategoryPage))

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPage);
