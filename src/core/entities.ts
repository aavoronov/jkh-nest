import { ComponentLoader } from 'adminjs';
import { ChatAdService } from '../chat-ad/chat-ad.service';
import { ChatAd } from '../chat-ad/entities/chat-ad.entity';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { RoomAccess } from '../chat-rooms/entities/room-access.entity';
import { NewWorkerObjectApplication } from '../chat-rooms/entities/worker-object-application.entity';
import { Message } from '../chat/entities/message.entity';
import { Complaint } from '../complaints/entities/complaint.entity';
import { EstateObjectRights } from '../estate-objects/entities/estate-object-rights.entity';
import { EstateObject } from '../estate-objects/entities/estate-object.entity';
import { EstateObjectsService } from '../estate-objects/estate-objects.service';
import { GenericData } from '../generic-data/entities/generic-data.entity';
import { MapObjectDetails } from '../map-objects/entities/map-object-details.entity';
import { MapObjectReply } from '../map-objects/entities/map-object-reply.entity';
import { MapObjectReview } from '../map-objects/entities/map-object-review.entity';
import { MapObject } from '../map-objects/entities/map-object.entity';
import { PollOption } from '../polls/entities/poll-options.entity';
import { PollReply } from '../polls/entities/poll-reply.entity';
import { Poll } from '../polls/entities/poll.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { ServiceReview } from '../services/entities/service-review';
import { ServiceSubcategory } from '../services/entities/service-subcategory.entity';
import { Service } from '../services/entities/service.entity';
import { TradingPlatformCategory } from '../trading-platform/entities/trading-platform-category.entity';
import { TradingPlatformFavorites } from '../trading-platform/entities/trading-platform-favorites.entity';
import { TradingPlatformProduct } from '../trading-platform/entities/trading-platform-product.entity';
import { TradingPlatformSubcategory } from '../trading-platform/entities/trading-platform-subcategory.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { WorkerProfile } from '../users/entities/worker-profile.entity';
import { UsersService } from '../users/users.service';
import { Account } from '../utilities/entities/account.entity';
import { PhoneVerifications } from '../verifications/entities/phone-verification.entity';
import { Verifications } from '../verifications/entities/verification.entity';

export const entities = [
  User,
  Profile,
  Verifications,
  PhoneVerifications,
  Message,
  ChatRoom,
  RoomAccess,
  MapObject,
  MapObjectDetails,
  MapObjectReview,
  MapObjectReply,
  EstateObject,
  EstateObjectRights,
  TradingPlatformCategory,
  TradingPlatformSubcategory,
  TradingPlatformProduct,
  TradingPlatformFavorites,
  WorkerProfile,
  Complaint,
  Service,
  ServiceCategory,
  ServiceSubcategory,
  ServiceReview,
  Account,
  Transaction,
  ChatAd,
  GenericData,
  NewWorkerObjectApplication,
  Poll,
  PollOption,
  PollReply,
];

export const componentLoader = new ComponentLoader();

const Components = {
  MyCustomAction: componentLoader.add('MyCustomAction', './components/custom'),
  Color: componentLoader.add('Color', './components/list/color'),
  ColorShow: componentLoader.add('ColorShow', './components/show/colorShow'),
  ProfilePic: componentLoader.add('ProfilePic', './components/list/ProfilePic'),
  ProfilePicShow: componentLoader.add(
    'ProfilePicShow',
    './components/show/ProfilePicShow',
  ),
  FileLink: componentLoader.add('FileLink', './components/list/fileLink'),
  FileLinkShow: componentLoader.add(
    'FileLinkShow',
    './components/show/fileLinkShow',
  ),
  ObjectWithComplaint: componentLoader.add(
    'ObjectWithComplaint',
    './components/list/objectWithComplaint',
  ),
  ObjectWithComplaintShow: componentLoader.add(
    'ObjectWithComplaintShow',
    './components/show/objectWithComplaintShow',
  ),
  Coordinates: componentLoader.add(
    'Coordinates',
    './components/list/coordinates',
  ),
  CoordinatesShow: componentLoader.add(
    'CoordinatesShow',
    './components/show/coordinates',
  ),
  MapObjectDetails: componentLoader.add(
    'MapObjectDetails',
    './components/list/mapObjectDetailsLink',
  ),
  MapObjectDetailsShow: componentLoader.add(
    'MapObjectDetailsShow',
    './components/show/mapObjectDetailsLink',
  ),
  MultipleImagesShow: componentLoader.add(
    'MultipleImagesShow',
    './components/show/multipleImagesShow',
  ),
};

const colorProperty = {
  type: 'string',
  components: {
    list: Components.Color, // see "Writing your own Components"
    show: Components.ColorShow,
  },
};

const profilePicProperty = {
  type: 'string',
  components: {
    list: Components.ProfilePic, // see "Writing your own Components"
    show: Components.ProfilePicShow,
  },
};

const multipleImagesProperty = {
  type: 'string',
  components: {
    // list: Components.ProfilePic, // see "Writing your own Components"
    show: Components.MultipleImagesShow,
  },
};

const fileProperty = {
  type: 'string',
  components: {
    list: Components.FileLink,
    show: Components.FileLinkShow,
  },
};

const timestampProperty = {
  isVisible: {
    edit: true,
    show: true,
    list: false,
    filter: false,
  },
};

const MapObjectDetailsProperty = {
  type: 'string',
  components: {
    list: Components.MapObjectDetails, // see "Writing your own Components"
    show: Components.MapObjectDetailsShow,
  },
};

const coordsProperty = {
  type: 'string',
  components: {
    list: Components.Coordinates,
    show: Components.CoordinatesShow,
  },
};

const approveWorker = async (id: number) => {
  const usersService = new UsersService();
  await usersService.approveWorkerOrResetTheirPassword(id);
};

const approveChatAd = async (id: number) => {
  const chatAdService = new ChatAdService(new TransactionsService());
  await chatAdService.approveChatAd(id);
};

const approveWorkerObjectApplication = async (id: number) => {
  const estateObjectsService = new EstateObjectsService();
  await estateObjectsService.approveWorkerObject(id);
};

const deleteMapObjectWithItsDetails = async (id: number) => {
  const record = await MapObject.findOne({
    where: { id: id },
    include: [{ model: MapObjectDetails }],
  });
  await record.destroy();
  await Complaint.destroy({
    where: { objectType: 'map object', objectId: id },
  });

  // console.log(record);
};

// const deleteMapObjectWithItsDetails = {
//   delete: {
//     actionType: 'record',
//     component: false,
//     handler: (request, response, context) => {
//       const { record, currentAdmin } = context;
//       return {
//         record: record.toJSON(currentAdmin),
//         msg: 'Hello world',
//       };
//     },
//   },
// };

const UserResource = {
  resource: User,
  options: {
    properties: {
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
    },
  },
};

const WorkerProfileResource = {
  resource: WorkerProfile,
  options: {
    properties: {
      color: colorProperty,
      profilePic: profilePicProperty,
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
      inn: fileProperty,
    },
    componentLoader,
    actions: {
      approve: {
        actionType: 'record',
        component: false,
        // handler: (request, response, context) => {
        //   const { record, currentAdmin } = context;
        //   // console.log(record);
        //   // approveWorker(record.id);
        //   return {
        //     record: record.toJSON(currentAdmin),
        //     // msg: 'Hello world',
        //   };
        // },
        handler: async (request, response, context) => {
          const { record, currentAdmin } = context;
          // console.log('record', record);
          await approveWorker(record.params.userId);
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
        // handler: async (request, response, data) => {
        //   const categories = await CategoryModel.find({}).limit(5)
        //   return {
        //     usersCount: await UserModel.countDocuments(),
        //     pagesCount: await PageModel.countDocuments(),
        //     categories: await Promise.all(categories.map(async c => {
        //       const comments = await CommentModel.countDocuments({ category: c._id })
        //       return {
        //         title: c.title,
        //         comments,
        //         _id: c._id,
        //       }}
      },
    },
  },
};

const ProfileResource = {
  resource: Profile,
  options: {
    properties: {
      color: colorProperty,
      profilePic: profilePicProperty,
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
    },
    componentLoader,
    actions: {
      myCustomAction: {
        actionType: 'record',
        component: Components.MyCustomAction,
        handler: (request, response, context) => {
          const { record, currentAdmin } = context;
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
      },
    },
  },
};

const ComplaintResource = {
  resource: Complaint,
  options: {
    properties: {
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
      objectId: {
        components: {
          list: Components.ObjectWithComplaint,
          show: Components.ObjectWithComplaintShow,
        },
      },
    },

    componentLoader,
  },
};

const MapObjectResource = {
  resource: MapObject,
  options: {
    properties: {
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
      point: coordsProperty,
      // details: MapObjectDetailsProperty,
    },
    actions: {
      delete: {
        actionType: 'record',
        component: false,
        handler: async (request, response, context) => {
          const { record, currentAdmin } = context;

          // // console.log(record.params.id);
          await deleteMapObjectWithItsDetails(record.params.id);
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
      },
    },
    componentLoader,
  },
};

const MapObjectDetailsResource = {
  resource: MapObjectDetails,
  options: {
    properties: {
      createdAt: timestampProperty,
      updatedAt: timestampProperty,
      images: multipleImagesProperty,
    },
    actions: {
      delete: {
        actionType: 'record',
        component: false,
        handler: async (request, response, context) => {
          const { record, currentAdmin } = context;

          // // console.log(record);
          await deleteMapObjectWithItsDetails(record.params.objectId);
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
      },
    },
    componentLoader,
  },
};

const ChatAdResource = {
  resource: ChatAd,
  options: {
    componentLoader,
    actions: {
      approve: {
        actionType: 'record',
        component: false,
        handler: async (request, response, context) => {
          const { record, currentAdmin } = context;
          // console.log('record', record);
          await approveChatAd(record.params.id);
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
      },
    },
  },
};

const NewWorkerObjectApplicationResource = {
  resource: NewWorkerObjectApplication,
  options: {
    componentLoader,
    actions: {
      approve: {
        actionType: 'record',
        component: false,
        handler: async (request, response, context) => {
          const { record, currentAdmin } = context;
          // console.log('record', record);
          await approveWorkerObjectApplication(record.params.id);
          return {
            record: record.toJSON(currentAdmin),
            msg: 'Hello world',
          };
        },
      },
    },
  },
};

export const resources = [
  UserResource,
  ProfileResource,
  Verifications,
  PhoneVerifications,
  Message,
  ChatRoom,
  RoomAccess,
  MapObjectResource,
  MapObjectDetailsResource,
  MapObjectReview,
  MapObjectReply,
  EstateObject,
  EstateObjectRights,
  TradingPlatformCategory,
  TradingPlatformSubcategory,
  TradingPlatformProduct,
  TradingPlatformFavorites,
  WorkerProfileResource,
  ComplaintResource,
  Service,
  ServiceCategory,
  ServiceSubcategory,
  ServiceReview,
  Account,
  Transaction,
  ChatAdResource,
  GenericData,
  NewWorkerObjectApplicationResource,
  Poll,
  PollOption,
  PollReply,
];
